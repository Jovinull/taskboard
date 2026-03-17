import getDb, { generateId } from "./db";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();
  const hashedPassword = await bcrypt.hash("123456", 10);

  console.log("Cleaning database...");
  db.exec("DELETE FROM comments");
  db.exec("DELETE FROM tasks");
  db.exec("DELETE FROM users");
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users', 'tasks', 'comments')");

  console.log("Seeding users...");
  const users = [
    { name: "Admin", email: "admin@taskboard.com", password: hashedPassword },
    { name: "João Silva", email: "joao@example.com", password: hashedPassword },
    { name: "Maria Oliveira", email: "maria@example.com", password: hashedPassword },
    { name: "Pedro Santos", email: "pedro@example.com", password: hashedPassword },
  ];

  const insertUser = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
  for (const user of users) {
    insertUser.run(user.name, user.email, user.password);
  }

  console.log("Seeding tasks...");
  const taskData = [
    {
      title: "Desenvolver layout do dashboard",
      description: "Criar a interface principal do sistema usando Tailwind e Lucide.",
      status: "done",
      priority: "high",
      public: 1,
      user_email: "admin@taskboard.com",
    },
    {
      title: "Configurar autenticação",
      description: "Implementar Next-Auth com credenciais e SQLite.",
      status: "done",
      priority: "urgent",
      public: 0,
      user_email: "admin@taskboard.com",
    },
    {
      title: "Refatorar banco de dados",
      description: "Mover lógica de migração para um arquivo separado.",
      status: "todo",
      priority: "medium",
      public: 0,
      user_email: "admin@taskboard.com",
    },
    {
      title: "Corrigir bugs na listagem",
      description: "As tarefas não estão sendo ordenadas por data de criação.",
      status: "in_progress",
      priority: "high",
      public: 1,
      user_email: "joao@example.com",
    },
    {
      title: "Escrever testes unitários",
      description: "Cobrir as funções de banco de dados com Jest.",
      status: "todo",
      priority: "low",
      public: 0,
      user_email: "joao@example.com",
    },
    {
      title: "Design do System Logo",
      description: "Criar uma identidade visual para o TaskBoard.",
      status: "review",
      priority: "medium",
      public: 1,
      user_email: "maria@example.com",
    },
    {
      title: "Preparar apresentação",
      description: "Slides para a reunião de demonstração da Sprint.",
      status: "todo",
      priority: "high",
      public: 1,
      user_email: "maria@example.com",
    },
    {
      title: "Otimizar consultas SQLite",
      description: "Adicionar índices nas colunas mais usadas.",
      status: "in_progress",
      priority: "medium",
      public: 0,
      user_email: "pedro@example.com",
    },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, status, priority, public, due_date, user_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const taskIds: string[] = [];
  for (const task of taskData) {
    const id = generateId();
    taskIds.push(id);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    
    insertTask.run(
      id,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.public,
      dueDate.toISOString(),
      task.user_email
    );
  }

  console.log("Seeding comments...");
  const commentTexts = [
    "Ótimo trabalho nisso!",
    "Preciso de ajuda para terminar a parte final.",
    "Acho que podemos melhorar a performance aqui.",
    "Revisado e pronto para produção.",
    "Podemos discutir isso na próxima reunião?",
    "Verifiquei o código e parece bom.",
    "Temos algum prazo fixo para isso?",
  ];

  const insertComment = db.prepare(`
    INSERT INTO comments (id, content, task_id, user_email, user_name)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 15; i++) {
    const taskId = taskIds[Math.floor(Math.random() * taskIds.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const content = commentTexts[Math.floor(Math.random() * commentTexts.length)];
    
    insertComment.run(
      generateId(),
      content,
      taskId,
      user.email,
      user.name
    );
  }

  console.log("Seeding complete! Log in with emails above and password '123456'");
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
