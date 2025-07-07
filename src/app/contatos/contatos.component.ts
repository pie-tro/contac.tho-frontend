import { Component, OnInit } from '@angular/core';
import { ContatosService } from '../contatos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Contato } from './contatos';

@Component({
  selector: 'app-contatos',
  standalone: false,
  templateUrl: './contatos.component.html',
  styleUrl: './contatos.component.css'
})
export class ContatosComponent implements OnInit {

  contatos: Contato[] = [];
  filteredContatos: Contato[] = [];
  formGroupContato: FormGroup;
  isEditing: boolean = false;
  selectedContatoId: number | null = null;

  searchTerm: string = '';
  filtroFavoritoAtivo: boolean = false; // ✅ Adicionado filtro por favoritos

  constructor(
    private service: ContatosService,
    private formBuilder: FormBuilder
  ) {
    this.formGroupContato = formBuilder.group({
      id: [null],
      nome: ['', Validators.required],
      apelido:[''],
      endereco: [''],
      aniversario: [''],
      categoria: [''],
      favorito: [false],
      redes: [''],
      observacoes: [''],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadContatos();
  }

  loadContatos() {
    this.service.getAll().subscribe({
      next: data => {
        this.contatos = data;
        this.filterContatos();
      },
      error: err => console.error('Erro ao carregar contatos:', err)
    });
  }

  save() {
    if (this.formGroupContato.valid) {
      const newContato: Contato = { ...this.formGroupContato.value };
      this.service.save(newContato).subscribe({
        next: savedContato => {
          this.contatos.push(savedContato);
          this.formGroupContato.reset();
          this.filterContatos();
        },
        error: err => console.error('Erro ao salvar contato:', err)
      });
    } else {
      console.log('Formulário inválido para salvar!');
      this.formGroupContato.markAllAsTouched();
    }
  }

  delete(contato: Contato) {
    if (contato.id) {
      this.service.delete(contato).subscribe({
        next: () => {
          console.log('Contato removido com sucesso!');
          this.loadContatos();
          this.clear();
        },
        error: err => console.error('Erro ao remover contato:', err)
      });
    }
  }

  onClickupdate(contato: Contato) {
    this.selectedContatoId = contato.id;
    this.isEditing = true;
    this.formGroupContato.patchValue(contato);

    if (contato.aniversario) {
      const date = new Date(contato.aniversario);
      const formattedDate = date.toISOString().split('T')[0];
      this.formGroupContato.get('aniversario')?.setValue(formattedDate);
    }
  }

  clear() {
    this.isEditing = false;
    this.formGroupContato.reset();
    this.selectedContatoId = null;
  }

  update() {
    if (this.formGroupContato.valid && this.selectedContatoId !== null) {
      const contatoAtualizado: Contato = { ...this.formGroupContato.value };
      contatoAtualizado.id = this.selectedContatoId;

      this.service.update(contatoAtualizado).subscribe({
        next: response => {
          console.log('Contato atualizado com sucesso!', response);
          this.clear();
          this.loadContatos();
        },
        error: error => {
          console.error('Erro ao atualizar contato:', error);
        }
      });
    } else {
      console.log('Formulário inválido ou ID do contato ausente para atualização!');
      this.formGroupContato.markAllAsTouched();
    }
  }

  // ✅ Novo método para alternar filtro de favoritos
  toggleFiltroFavorito() {
    this.filtroFavoritoAtivo = !this.filtroFavoritoAtivo;
    this.filterContatos();
  }

  // ✅ Atualizado para considerar favoritos
  filterContatos(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    this.filteredContatos = this.contatos.filter(contato => {
      const nomeMatch = contato.nome?.toLowerCase().includes(termo);
      const emailMatch = contato.email?.toLowerCase().includes(termo);
      const categoriaMatch = contato.categoria?.toLowerCase().includes(termo);
      const telefoneMatch = contato.telefone?.toLowerCase().includes(termo);
      const enderecoMatch = contato.endereco?.toLowerCase().includes(termo);

      const atendeBusca = !termo || nomeMatch || emailMatch || categoriaMatch || telefoneMatch || enderecoMatch;
      const atendeFavorito = !this.filtroFavoritoAtivo || contato.favorito === true;

      return atendeBusca && atendeFavorito;
    });
  }
}
