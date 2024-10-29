import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { Context } from '../../components/interfaces';
import { mkdirSync, writeFileSync } from 'fs';
import type { PageServerLoadEvent, RouteParams } from './$types';
import { fail } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import type { File } from 'buffer';
import { applyInjector, generateXMI } from "../../components/utils";

let projectName: string = 'defaultProjectName';
export const load = async ({ url }) => {
    projectName = url.searchParams.get('projectName') || projectName;
    return { projectName };
};

export const actions: Actions = {
	context: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		const { fields, ...selected } = data;
		const xmi = generateXMI(
			JSON.parse(fields as string) as Context,
			selected as { [key: string]: string }
		);
		console.log("este es el projectName de context",projectName);
		mkdirSync(`files/${projectName}`, { recursive: true }); // Create the folder if it doesn't exist
		writeFileSync(`files/${projectName}/context.xmi`, xmi);
		return {
			success: true
		};
	},
	process: async ({ request}: RequestEvent) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		if (
			!(data.process as unknown as File).name ||
			(data.process as unknown as File).name === 'undefined'
		) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}
		const { process } = data as unknown as { process: File };
		// Write the file to the static folder
		mkdirSync(`files/${projectName}`, { recursive: true }); // Create the folder if it doesn't exist
		writeFileSync(`files/${projectName}/process.bpmn`, Buffer.from(await process.arrayBuffer()));
		writeFileSync(
			'injectorExtractor/InjectorInput/process.bpmn',
			Buffer.from(await process.arrayBuffer())
		);
		return {
			success: true
		};
	},
	submit: async ({ request }: RequestEvent) => {
		// execute jar with both files
		await applyInjector();
		let contextContent = readFileSync(`files/${projectName}/context.xmi`, 'utf-8');
		let processContent = readFileSync('injectorExtractor/InjectorOutput/process.xmi', 'utf-8');
		return {
			success: true,
			context: contextContent,
			process: processContent
		};
	}
};
