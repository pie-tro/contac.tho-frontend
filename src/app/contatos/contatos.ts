export interface Contato {
    id: number;
    nome: string;
    apelido: string;
    email: string;
    endereco: string;
    aniversario: Date;
    categoria: string;
    favorito: boolean;
    redes: string[];
    observacoes: string;
    telefone: string;
}