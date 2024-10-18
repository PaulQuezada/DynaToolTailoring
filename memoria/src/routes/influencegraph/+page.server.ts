import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { Context } from '../../components/interfaces';
import { mkdirSync, writeFileSync } from 'fs';
import type { PageServerLoadEvent, RouteParams } from './$types';
import { fail } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import type { File } from 'buffer';
import { applyInjector, generateXMI } from "../../components/utils";

let projectName: string;
export async function load(event: PageServerLoadEvent & { params: RouteParams & { slug: string } }) {
	projectName = event.params.slug;
}

export const actions: Actions = {
	evaluate: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const { aggregated_value, optimization_type } = Object.fromEntries(formData.entries());
		const result = (Math.random() * 10).toFixed(2);
		return {
			success: true,
			aggregated_value,
			optimization_type,
			result
		};
	},
	context: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		const { fields, ...selected } = data;
		const xmi = generateXMI(
			JSON.parse(fields as string) as Context,
			selected as { [key: string]: string }
		);
		mkdirSync(`files`, { recursive: true }); // Create the folder if it doesn't exist
		writeFileSync(`files/context.xmi`, xmi);
		return {
			success: true
		};
	},
	process: async ({ request }: RequestEvent) => {
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
		mkdirSync(`files/`, { recursive: true }); // Create the folder if it doesn't exist
		writeFileSync(`files/process.bpmn`, Buffer.from(await process.arrayBuffer()));
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
		let contextContent = readFileSync('files/context.xmi', 'utf-8');
		let processContent = readFileSync('injectorExtractor/InjectorOutput/process.xmi', 'utf-8');
		return {
			success: true,
			context: contextContent,
			process: processContent
		};
	}
};
