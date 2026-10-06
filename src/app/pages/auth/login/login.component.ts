import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <section class="auth-card">
      <h1>Inici de sessió</h1>
      <p>Front de JJAUX en funcionament</p>
      <form>
        <label>
          Correu
          <input type="email" placeholder="nom@empresa.com" />
        </label>
        <label>
          Contrasenya
          <input type="password" placeholder="••••••••" />
        </label>
        <button type="button">Entrar</button>
      </form>
    </section>
  `,
  styles: [
    `
      .auth-card {
        width: min(440px, 100%);
        background: white;
        padding: 2rem;
        border-radius: 18px;
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
      }
      h1 {
        margin: 0 0 0.5rem;
      }
      p {
        margin: 0 0 1.5rem;
        color: #4b5563;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        font-weight: 600;
      }
      input {
        border: 1px solid #d1d5db;
        border-radius: 10px;
        padding: 0.8rem 0.9rem;
        font-size: 1rem;
      }
      button {
        margin-top: 0.5rem;
        border: none;
        background: #2563eb;
        color: white;
        padding: 0.9rem 1rem;
        border-radius: 10px;
        font-weight: 700;
        cursor: pointer;
      }
    `
  ]
})
export class LoginComponent {}
