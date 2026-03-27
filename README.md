# Pet Scheduler

Aplicacao web de agendamento de servicos para pets, com fluxos separados para clientes, prestadores e administrador.

O projeto foi construido com Next.js, Firebase Authentication, Cloud Firestore, Tailwind CSS e validacao com Zod.

## Visao geral

O sistema permite:

- cadastro e login de clientes e prestadores
- login administrativo separado
- publicacao, edicao e exclusao de servicos por prestadores
- configuracao de disponibilidade semanal por servico
- agendamento com validacao de disponibilidade e conflito de horario
- listagem de agendamentos por cliente e por prestador
- alteracao de status do agendamento pelo prestador
- painel administrativo com filtros de agendamentos e remocao de prestadores

## Tecnologias

- Next.js 16
- React 19
- Firebase Auth
- Cloud Firestore
- Zod
- React Toastify
- Tailwind CSS 4
- Biome
- bcryptjs
- JWT

## Perfis

### Cliente

- pode se cadastrar e fazer login
- pode navegar pelos servicos publicados
- pode agendar um servico
- pode acompanhar seus agendamentos em `/meus-agendamentos`

### Prestador

- pode se cadastrar e fazer login
- pode acessar `/dashboard-prestador`
- pode criar, editar e excluir servicos
- pode configurar dias e horarios disponiveis
- pode visualizar sua agenda
- pode atualizar o status dos agendamentos marcados com ele

### Admin

- possui login proprio em `/admin/login`
- acessa `/admin`
- pode filtrar agendamentos por status e data
- pode visualizar prestadores cadastrados
- pode deletar prestadores e os dados vinculados a eles no Firestore

## Rotas principais

- `/` - pagina inicial
- `/cadastro` - cadastro de cliente ou prestador
- `/login` - login de cliente ou prestador
- `/servicos` - catalogo publico de servicos
- `/servicos/[id]` - detalhe do servico
- `/agendamento` - criacao de agendamento
- `/meus-agendamentos` - area do cliente e do prestador
- `/dashboard-prestador` - painel do prestador
- `/admin/login` - login administrativo
- `/admin` - painel administrativo

## Regras de negocio importantes

- o prestador nao acessa `/servicos`
- visitante nao ve o link de servicos no navbar
- o admin nao pode agendar servicos
- o agendamento so eh criado se:
  - a data estiver dentro da disponibilidade do prestador
  - o intervalo completo do servico couber no horario configurado
  - nao houver conflito com outro agendamento ativo no mesmo intervalo
- agendamentos com status `cancelado` nao bloqueiam horarios

## Estrutura de dados no Firebase

### Colecoes usadas

#### `usuarios`

Documento salvo com o `uid` do Firebase Auth:

```json
{
  "nome": "Nome do usuario",
  "email": "email@exemplo.com",
  "perfil": "cliente | prestador",
  "criadoEm": "Date"
}
```

#### `servicos`

```json
{
  "prestadorId": "uid-do-prestador",
  "nome": "Banho",
  "duracaoMinutos": 60,
  "descricao": "Descricao do servico",
  "disponibilidade": [
    {
      "day": "monday",
      "enabled": true,
      "start": "09:00",
      "end": "18:00"
    }
  ],
  "ativo": true
}
```

#### `agendamentos`

```json
{
  "clienteId": "uid-do-cliente",
  "prestadorId": "uid-do-prestador",
  "servicoId": "id-do-servico",
  "data": "2026-03-27",
  "horario": "10:00",
  "duracaoMinutos": 60,
  "pet": "Nome do pet",
  "observacoes": "Texto opcional",
  "status": "confirmado",
  "criadoEm": "Date"
}
```

#### `configuracoes/admin_login`

Documento usado no login administrativo:

```json
{
  "email": "admin@exemplo.com",
  "senha": "hash-bcrypt",
  "nome": "Administrador"
}
```

## Variaveis de ambiente

Crie um arquivo `.env.local` com os valores do seu projeto Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_ADMIN_JWT_SECRET=
```

## Como rodar

Instale as dependencias:

```bash
npm install
```

Inicie em desenvolvimento:

```bash
npm run dev
```

## Scripts

- `npm run dev` - sobe o ambiente de desenvolvimento
- `npm run build` - gera build de producao
- `npm run start` - sobe a aplicacao em producao
- `npm run lint` - executa `biome check`
- `npm run format` - executa `biome format --write`

## Estrutura do projeto

```text
src/
  app/
    admin/
    agendamento/
    cadastro/
    dashboard-prestador/
    login/
    meus-agendamentos/
    servicos/
  components/
    forms/
    ui/
  hooks/
  lib/
    firebase/
      firestore/
    utils/
```

## Camada Firebase

A organizacao do Firebase esta concentrada em `src/lib/firebase`:

- `client.js` - inicializacao do Firebase client
- `auth.js` - cadastro, login, logout e leitura do usuario atual
- `firestore/users.js` - operacoes relacionadas a usuarios
- `firestore/services.js` - operacoes relacionadas a servicos
- `firestore/agendamentos.js` - operacoes relacionadas a agendamentos
- `firestore/admin.js` - login administrativo

## Utilitario para senha do admin

Existe um utilitario em `src/lib/utils/hashAdminPassword.js` para gerar o hash bcrypt da senha que sera salva em `configuracoes/admin_login`.

Exemplo:

```bash
node src/lib/utils/hashAdminPassword.js
```

Depois disso, salve o hash retornado no Firestore.

## Observacoes

- a exclusao de prestador remove o documento do usuario, os servicos vinculados e os agendamentos vinculados no Firestore
- essa exclusao nao remove automaticamente a conta do Firebase Auth
- a sessao do admin eh mantida em cookie com JWT no client
- os formularios usam Zod para validacao

## Autor

Projeto desenvolvido por [DevLDRC](https://github.com/Equipe-NextSolve/agendamento-project/commits?author=DevLDRC) e [JoaoGui1430](https://github.com/Equipe-NextSolve/agendamento-project/commits?author=JoaoGui1430).
