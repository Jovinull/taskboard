# TaskBoard  

TaskBoard é uma aplicação de gerenciamento de tarefas desenvolvida com **Next.js**, **Firebase** e **Next-Auth**. Projetada para oferecer uma experiência moderna e intuitiva, a plataforma permite que os usuários criem, compartilhem e interajam com tarefas de forma eficiente e segura.  

## 🚀 Funcionalidades  

- **Autenticação Segura:** Login via Google com integração ao Next-Auth.  
- **Gerenciamento de Tarefas:** Criação, edição, exclusão e definição de visibilidade (pública ou privada) das tarefas.  
- **Compartilhamento Simplificado:** Tarefas públicas podem ser compartilhadas por links únicos.  
- **Interação com Comentários:** Usuários autenticados podem comentar em tarefas públicas, promovendo discussões e feedbacks.  
- **Banco de Dados em Tempo Real:** Alterações são refletidas imediatamente na aplicação utilizando Firebase Firestore.  

## 🛠️ Tecnologias Utilizadas  

- **Next.js:** Framework para desenvolvimento de aplicações React, com suporte a renderização no servidor e geração de páginas estáticas.  
- **Firebase Firestore:** Banco de dados NoSQL para armazenamento em tempo real.  
- **Next-Auth:** Biblioteca de autenticação para Next.js, utilizada para login via Google.  
- **CSS Modules:** Estilização modular para um design limpo e organizado.  

## 📸 Capturas de Tela  

1. **Tela de Login**  
   Login seguro e prático utilizando contas do Google.  

2. **Dashboard**  
   Visão geral das tarefas, com opções para adicionar novas tarefas.  

3. **Tela de Criação de Tarefas**  
   Registro de tarefas com configuração de visibilidade (públicas ou privadas).  

4. **Tarefas Públicas**  
   Explore e compartilhe tarefas públicas por links únicos.  

5. **Seção de Comentários**  
   Interação entre usuários por meio de feedbacks e discussões em tarefas públicas.  

## 💻 Como Rodar o Projeto  

### Pré-requisitos  

- Node.js (versão LTS recomendada)  
- Conta no Firebase para configurar o Firestore e autenticação  
- Chave de API do Google para Next-Auth  

### Passo a Passo  

1. Clone o repositório:  
   ```bash
   git clone https://github.com/seu-usuario/taskboard.git
   cd taskboard
   ```  

2. Instale as dependências:  
   ```bash
   npm install
   ```  

3. Configure as variáveis de ambiente:  
   Crie um arquivo `.env.local` com as seguintes variáveis:  
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=YOUR_SECRET
   GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   ```  

4. Inicie o servidor de desenvolvimento:  
   ```bash
   npm run dev
   ```  

5. Acesse a aplicação no navegador:  
   ```
   http://localhost:3000
   ```  

## 🚧 Melhorias Futuras  

- **Notificações em Tempo Real:** Alertar usuários sobre novos comentários em suas tarefas.  
- **Busca Avançada:** Filtros para facilitar a localização de tarefas específicas.  
- **Dashboard Personalizado:** Painéis personalizados com base nas preferências do usuário.  

## 🤝 Contribuindo  

Sinta-se à vontade para contribuir com o TaskBoard!  

1. Faça um fork do projeto.  
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.  
3. Envie suas mudanças: `git push origin minha-feature`.  
4. Abra um Pull Request.  

## 📜 Licença  

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.  

## ✨ Agradecimentos  

- Ao meu professor [Nome do Professor] pelo suporte e ensinamentos durante o desenvolvimento.  
- À comunidade de desenvolvedores por recursos e inspiração.  

## 📬 Contato  

- **LinkedIn:** [Felipe Jovino dos Santos](https://www.linkedin.com/in/jobas/)  
- **E-mail:** [felipejovinogamerplay@gmail.com](felipejovinogamerplay@gmail.com)  