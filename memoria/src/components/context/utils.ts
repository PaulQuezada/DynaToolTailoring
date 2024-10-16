import type { Context } from "./interfaces";
import { v4 as uuidv4 } from "uuid";
import { promisify } from 'util';
import { exec } from 'child_process';

export const generateXMI = (context: Context, selectedData: { [key: string]: string }): string => {
  const headerId = uuidv4();
  let file =
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    `<spcm:Context xmlns:spcm="http://contextmetamodel/1.0" xmlns:xmi="http://www.omg.org/XMI" description="Test" name="Test" xmi:id="${headerId}" xmi:version="2.0">\n`;

  // Maps to store uuids for attributes and options
  const attributeIds: { [key: string]: string } = {};
  const optionIds: { [key: string]: string } = {};

  for (let i = 0; i < context.dimensions.length; i++) {
    const dimension = context.dimensions[i];
    const dimensionId = uuidv4();
    file += `\t<myDimensions description="" name="${dimension.name}" xmi:id="${dimensionId}">\n`;

    for (let j = 0; j < dimension.attributes.length; j++) {
      const attribute = dimension.attributes[j];
      const attributeId = uuidv4();
      // Use dimension name and attribute name as a key
      const attributeKey = `${dimension.name}.${attribute.name}`;
      attributeIds[attributeKey] = attributeId;

      file += `\t\t<myContextAttributes description="" name="${attribute.name}" xmi:id="${attributeId}">\n`;

      for (let k = 0; k < attribute.options.length; k++) {
        const option = attribute.options[k];
        const optionId = uuidv4();
        // Use attribute key and option name as a key
        const optionKey = `${attributeKey}.${option}`;
        optionIds[optionKey] = optionId;

        file += `\t\t\t<posibleValues description="${option}" name="${option}" value="${option}" xmi:id="${optionId}"/>\n`;
      }
      file += '\t\t</myContextAttributes>\n';
    }
    file += '\t</myDimensions>\n';
  }

  file += `\t<myContextConfigurations name="Context model" xmi:id="${uuidv4()}">\n`;
  for (const dimension of context.dimensions) {
    for (const attribute of dimension.attributes) {
      const selectedOption = selectedData[`${dimension.name}.${attribute.name}`];
      const attributeKey = `${dimension.name}.${attribute.name}`;
      const optionKey = `${attributeKey}.${selectedOption}`;
      const attributeId = attributeIds[attributeKey];
      const optionId = optionIds[optionKey];

      file += `\t\t<contextAttributeConfiguration description="" myContextAttributeValue="${optionId}" myContextElement="${attributeId}" name="${
        attribute.name
      }" xmi:id="${uuidv4()}"/>\n`;
    }
  }
  file += '\t</myContextConfigurations>\n' + '</spcm:Context>';

  return file;
};

const execPromise = promisify(exec);

export const applyInjector = async () => {
	try {
		const { stdout, stderr } = await execPromise(
			'cd injectorExtractor && java -jar injectorExtractor.jar "process.bpmn" "inyector"'
		);
		if (stderr) {
			console.error('stderr: ' + stderr);
		}
	} catch (error) {
		console.error('exec error: ' + error);
	}
};