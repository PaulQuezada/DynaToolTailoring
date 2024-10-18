import { XMLParser } from 'fast-xml-parser';
import type { InfluenceGraph, Influence, Node } from './interfaces';

async function parseXML(xmlText: string): Promise<InfluenceGraph> {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
    });

    const result = parser.parse(xmlText);

    const graph: InfluenceGraph = {
      nodes: result['dynatail:CGModel']['cgnode'].map((nodeData: any) => {
        const node: Node = {
          type: nodeData['xsi:type'].replace(/^.*:/, ''),
          name: nodeData['name'],
        };
        return node;
      }),
      influences: result['dynatail:CGModel']['cginfluence'].map((influenceData: any) => {
        const source = influenceData['source'].replace('//@cgnode.', '');
        const target = influenceData['target'].replace('//@cgnode.', '');

        const influence: Influence = {
          source: parseInt(source, 10),
          target: parseInt(target, 10),
          value: parseFloat(influenceData['value']),
        };
        return influence;
      }),
    };
    return graph;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { parseXML };
