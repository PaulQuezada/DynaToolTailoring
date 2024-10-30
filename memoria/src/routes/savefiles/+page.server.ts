import type { RequestEvent } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { mkdirSync, writeFileSync } from 'fs';

export const actions: Actions = {
	sendData: async ({ request }: RequestEvent) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		const { atlCode, tailoringModel, projectName } = data as Record<string, string>;

		try {
			// Crear el directorio si no existe
			mkdirSync(`files/${projectName}`, { recursive: true });

			// Guardar atlCode y tailoringModel como archivos de texto
			writeFileSync(`files/${projectName}/atlcode.atl`, atlCode);
			writeFileSync(`files/${projectName}/tailoringmodel.xmi`, tailoringModel);

			console.log("Archivos guardados correctamente.");
			return {
				success: true
			}
		} catch (error) {
			console.error("Error al guardar los archivos:", error);
			return {
				success: false,
				error: "Error al guardar los archivos."
			};
		}
	},
};
