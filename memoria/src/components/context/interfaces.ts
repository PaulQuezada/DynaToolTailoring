export interface Node {
	type: string;
	name: string;
}

export interface Influence {
	source: number;
	target: number;
	value: number;
}

export interface InfluenceGraph {
	nodes: Node[];
	influences: Influence[];
}

export interface Context {
	dimensions: Dimension[];
}

export interface Dimension {
	name: string;
	attributes: Attribute[];
}

export interface Attribute {
	name: string;
	options: string[];
}
