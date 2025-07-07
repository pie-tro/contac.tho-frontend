import { Component, OnInit } from '@angular/core';
import { ContatosService } from '../contatos.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import Validators
import { Observable } from 'rxjs';
// import { json } from 'body-parser'; // This import seems unused and might cause issues, removed it.
import { Contato } from '../contatos/contatos';

@Component({
  selector: 'app-cadastro',
  standalone: false,
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements OnInit {

  contatos: Contato[]= [];
  formGroupContato : FormGroup;
  isEditing: boolean=false;

  constructor(private service: ContatosService,
              private formBuilder: FormBuilder
  ){
      this.formGroupContato = formBuilder.group({
        id: [],
        nome: ['', Validators.required],
        apelido:[''],// Nome is now required
        endereco: [''],
        aniversario: [''],
        categoria: [''],
        favorito: [false],
        redes: [''],
        observacoes: [''],
        telefone: ['', Validators.required], // Telefone is now required
        email: ['', [Validators.required, Validators.email]] // Email is now required and must be a valid email format
      });

  }

  ngOnInit(): void {
    this.loadContatos();
  }

  loadContatos(){
    this.service.getAll().subscribe({
      next: json => this.contatos = json
    });
  }
  
  save() {
  this.formGroupContato.markAllAsTouched();

  if (this.formGroupContato.invalid) {
    alert('Por favor, preencha todos os campos obrigatórios corretamente.');
    return;
  }

  const novoEmail = this.formGroupContato.get('email')?.value.trim().toLowerCase();
  const novoTelefone = this.formGroupContato.get('telefone')?.value.trim();

  const emailDuplicado = this.contatos.some(c => c.email.trim().toLowerCase() === novoEmail);
  const telefoneDuplicado = this.contatos.some(c => c.telefone.trim() === novoTelefone);

  // Limpa erros anteriores (se houver)
  this.formGroupContato.get('email')?.setErrors(null);
  this.formGroupContato.get('telefone')?.setErrors(null);

  if (emailDuplicado) {
    this.formGroupContato.get('email')?.setErrors({ emailTaken: true });
  }

  if (telefoneDuplicado) {
    this.formGroupContato.get('telefone')?.setErrors({ phoneTaken: true });
  }

  if (emailDuplicado || telefoneDuplicado) {
    return;
  }

  this.service.save(this.formGroupContato.value).subscribe({
    next: json => {
      this.contatos.push(json);
      this.formGroupContato.reset();
      alert('Contato salvo com sucesso!');
    },
    error: err => {
      console.error('Erro ao salvar contato:', err);
      alert('Ocorreu um erro ao salvar o contato. Tente novamente.');
    }
  });
}

  delete(contato: Contato) {
    this.service.delete(contato).subscribe({
      next: () => {
        this.loadContatos();
        alert('Contato excluído com sucesso!'); // Confirmation message
      },
      error: err => {
        console.error('Erro ao excluir contato:', err);
        alert('Ocorreu um erro ao excluir o contato. Tente novamente.');
      }
    });
  }

  onClickupdate(contato: Contato) {
    this.isEditing = true;
    this.formGroupContato.setValue(contato);
  }

  clear(){
    this.isEditing = false;
    this.formGroupContato.reset(); // Reset form fields and validation state
  }

  update() {
  this.formGroupContato.markAllAsTouched();

  if (this.formGroupContato.invalid) {
    alert('Por favor, preencha todos os campos obrigatórios corretamente.');
    return;
  }

  const contatoEditado = this.formGroupContato.value;
  const idAtual = contatoEditado.id;

  const novoEmail = contatoEditado.email.trim().toLowerCase();
  const novoTelefone = contatoEditado.telefone.trim();

  const emailDuplicado = this.contatos.some(c => c.id !== idAtual && c.email.trim().toLowerCase() === novoEmail);
  const telefoneDuplicado = this.contatos.some(c => c.id !== idAtual && c.telefone.trim() === novoTelefone);

  // Limpa erros anteriores
  this.formGroupContato.get('email')?.setErrors(null);
  this.formGroupContato.get('telefone')?.setErrors(null);

  if (emailDuplicado) {
    this.formGroupContato.get('email')?.setErrors({ emailTaken: true });
  }

  if (telefoneDuplicado) {
    this.formGroupContato.get('telefone')?.setErrors({ phoneTaken: true });
  }

  if (emailDuplicado || telefoneDuplicado) {
    return;
  }

  this.service.update(contatoEditado).subscribe({
    next: () => {
      this.loadContatos();
      this.isEditing = false;
      this.formGroupContato.reset();
      alert('Contato atualizado com sucesso!');
    },
    error: err => {
      console.error('Erro ao atualizar contato:', err);
      alert('Ocorreu um erro ao atualizar o contato. Tente novamente.');
    }
  });
}
}