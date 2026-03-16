# Tarefas+

Aplicacao web para gerenciamento de tarefas com sistema de compartilhamento e comentarios. Permite criar tarefas publicas ou privadas, compartilhar por link e interagir com outros usuarios atraves de comentarios.

## Funcionalidades

- **Autenticacao com Google** via NextAuth
- **Criacao e exclusao de tarefas** com visibilidade publica ou privada
- **Compartilhamento por link** para tarefas publicas
- **Comentarios** em tarefas publicas (usuarios autenticados)
- **Sincronizacao em tempo real** com Firebase Firestore

## Stack

- [Next.js](https://nextjs.org/) (Pages Router, SSR/SSG)
- [Firebase Firestore](https://firebase.google.com/) como banco de dados
- [NextAuth.js](https://next-auth.js.org/) para autenticacao
- [TypeScript](https://www.typescriptlang.org/)
- CSS Modules

## Como rodar

### Pre-requisitos

- Node.js 18+
- Projeto no Firebase com Firestore habilitado
- Credenciais OAuth do Google (Google Cloud Console)

### Configuracao

1. Clone o repositorio:

```bash
git clone https://github.com/felipejovino/taskboard.git
cd taskboard
```

2. Instale as dependencias:

```bash
npm install
```

3. Crie o arquivo `.env.local` baseado no `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Preencha com suas credenciais do Firebase e Google OAuth.

4. Rode o projeto:

```bash
npm run dev
```

Acesse em `http://localhost:3000`.

## Estrutura

```
src/
  components/     # Componentes reutilizaveis (Header, Textarea)
  pages/          # Rotas da aplicacao
    api/auth/     # Configuracao do NextAuth
    dashboard/    # Painel do usuario
    task/         # Pagina de detalhes da tarefa
  services/       # Conexao com Firebase
  styles/         # Estilos globais
```

## Variaveis de ambiente

Veja `.env.local.example` para a lista completa de variaveis necessarias.

## Licenca

MIT - veja [LICENSE](LICENSE) para detalhes.

## Autor

Felipe Jovino - [LinkedIn](https://www.linkedin.com/in/jobas/) - felipejovinogamerplay@gmail.com
