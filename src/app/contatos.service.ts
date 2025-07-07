import { HttpClient, HttpParams } from '@angular/common/http'; // Import HttpParams
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contato } from './contatos/contatos'; // Ensure this path is correct for your project

@Injectable({
  providedIn: 'root'
})
export class ContatosService {

  // Your backend API base URL
  apiurl = "https://pietromaia.duckdns.org/agenda"; 

  constructor(private http: HttpClient) {}

  getAll() : Observable <Contato[]>{
    return this.http.get<Contato[]>(this.apiurl);
  }

  save(contato: Contato): Observable<Contato>{
    return this.http.post<Contato>(this.apiurl, contato);
  }

  delete(contato: Contato): Observable<void>{
    return this.http.delete<void>(`${this.apiurl}/${contato.id}`);
  }

  update(contato: Contato) : Observable<Contato>{
    return this.http.put<Contato>(`${this.apiurl}/${contato.id}`, contato);
  }


  checkEmailExists(email: string, currentId?: number): Observable<boolean> {
    let params = new HttpParams().set('email', email);
    if (currentId) {
      params = params.set('id', currentId.toString()); // Convert number to string for HttpParams
    }
    return this.http.get<boolean>(`${this.apiurl}/existsByEmail`, { params });
  }

  
  checkPhoneExists(phone: string, currentId?: number): Observable<boolean> {
    let params = new HttpParams().set('phone', phone); // IMPORTANT: Ensure your Spring Boot @RequestParam is named 'phone'
    if (currentId) {
      params = params.set('id', currentId.toString()); // Convert number to string for HttpParams
    }
    // This will call http://localhost:8080/agenda/existsByPhone?phone=...&id=... (optional id)
    return this.http.get<boolean>(`${this.apiurl}/existsByPhone`, { params });
  }
}