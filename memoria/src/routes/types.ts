// Interfaz base para todos los tipos de reglas
interface BaseRule {
    id: number;
    type: 'Simple' | 'Conector' | 'Complex';
}

// Interfaz para reglas simples
interface SimpleRule extends BaseRule {
    type: 'Simple';
    numberRule: number;
    attribute: string;
    value: string;
    attributes: string[];
    values: string[];
}

// Interfaz para reglas conectoras
interface ConnectorRule extends BaseRule {
    type: 'Conector';
    logical_operator: string;
    logicals: string[];
}

// Interfaz para reglas complejas
interface ComplexRule extends BaseRule {
    type: 'Complex';
    numberRule: number;
    rules: Rule[]; // Utiliza el tipo de unión aquí para referirse a cualquier tipo de regla
}

// Tipo de unión para referirse a cualquier tipo de regla
type Rule = SimpleRule | ConnectorRule | ComplexRule;

interface activity {
    id: number;
    name: string;
    rules: Rule[];
    deleted?: boolean;
    replaced?: boolean;
    replaceActivity?: string;
}