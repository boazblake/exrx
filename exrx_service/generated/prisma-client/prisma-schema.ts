// Code generated by Prisma (prisma@1.34.10). DO NOT EDIT.
  // Please don't change this file manually but run `prisma generate` to update it.
  // For more information, please read the docs: https://www.prisma.io/docs/prisma-client/

export const typeDefs = /* GraphQL */ `type AggregateBiometric {
  count: Int!
}

type AggregateClient {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type BatchPayload {
  count: Long!
}

type Biometric {
  id: ID!
  clientId: Client
  weight: Float
  height: Float
  createdAt: DateTime!
}

type BiometricConnection {
  pageInfo: PageInfo!
  edges: [BiometricEdge]!
  aggregate: AggregateBiometric!
}

input BiometricCreateInput {
  id: ID
  clientId: ClientCreateOneWithoutBiometricsInput
  weight: Float
  height: Float
}

input BiometricCreateManyWithoutClientIdInput {
  create: [BiometricCreateWithoutClientIdInput!]
  connect: [BiometricWhereUniqueInput!]
}

input BiometricCreateWithoutClientIdInput {
  id: ID
  weight: Float
  height: Float
}

type BiometricEdge {
  node: Biometric!
  cursor: String!
}

enum BiometricOrderByInput {
  id_ASC
  id_DESC
  weight_ASC
  weight_DESC
  height_ASC
  height_DESC
  createdAt_ASC
  createdAt_DESC
}

type BiometricPreviousValues {
  id: ID!
  weight: Float
  height: Float
  createdAt: DateTime!
}

input BiometricScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  weight: Float
  weight_not: Float
  weight_in: [Float!]
  weight_not_in: [Float!]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  height: Float
  height_not: Float
  height_in: [Float!]
  height_not_in: [Float!]
  height_lt: Float
  height_lte: Float
  height_gt: Float
  height_gte: Float
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  AND: [BiometricScalarWhereInput!]
  OR: [BiometricScalarWhereInput!]
  NOT: [BiometricScalarWhereInput!]
}

type BiometricSubscriptionPayload {
  mutation: MutationType!
  node: Biometric
  updatedFields: [String!]
  previousValues: BiometricPreviousValues
}

input BiometricSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: BiometricWhereInput
  AND: [BiometricSubscriptionWhereInput!]
  OR: [BiometricSubscriptionWhereInput!]
  NOT: [BiometricSubscriptionWhereInput!]
}

input BiometricUpdateInput {
  clientId: ClientUpdateOneWithoutBiometricsInput
  weight: Float
  height: Float
}

input BiometricUpdateManyDataInput {
  weight: Float
  height: Float
}

input BiometricUpdateManyMutationInput {
  weight: Float
  height: Float
}

input BiometricUpdateManyWithoutClientIdInput {
  create: [BiometricCreateWithoutClientIdInput!]
  delete: [BiometricWhereUniqueInput!]
  connect: [BiometricWhereUniqueInput!]
  set: [BiometricWhereUniqueInput!]
  disconnect: [BiometricWhereUniqueInput!]
  update: [BiometricUpdateWithWhereUniqueWithoutClientIdInput!]
  upsert: [BiometricUpsertWithWhereUniqueWithoutClientIdInput!]
  deleteMany: [BiometricScalarWhereInput!]
  updateMany: [BiometricUpdateManyWithWhereNestedInput!]
}

input BiometricUpdateManyWithWhereNestedInput {
  where: BiometricScalarWhereInput!
  data: BiometricUpdateManyDataInput!
}

input BiometricUpdateWithoutClientIdDataInput {
  weight: Float
  height: Float
}

input BiometricUpdateWithWhereUniqueWithoutClientIdInput {
  where: BiometricWhereUniqueInput!
  data: BiometricUpdateWithoutClientIdDataInput!
}

input BiometricUpsertWithWhereUniqueWithoutClientIdInput {
  where: BiometricWhereUniqueInput!
  update: BiometricUpdateWithoutClientIdDataInput!
  create: BiometricCreateWithoutClientIdInput!
}

input BiometricWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  clientId: ClientWhereInput
  weight: Float
  weight_not: Float
  weight_in: [Float!]
  weight_not_in: [Float!]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  height: Float
  height_not: Float
  height_in: [Float!]
  height_not_in: [Float!]
  height_lt: Float
  height_lte: Float
  height_gt: Float
  height_gte: Float
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  AND: [BiometricWhereInput!]
  OR: [BiometricWhereInput!]
  NOT: [BiometricWhereInput!]
}

input BiometricWhereUniqueInput {
  id: ID
}

type Client {
  id: ID!
  firstname: String!
  lastname: String!
  email: String!
  birthdate: DateTime!
  biometrics(where: BiometricWhereInput, orderBy: BiometricOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Biometric!]
  trainerId: User
}

type ClientConnection {
  pageInfo: PageInfo!
  edges: [ClientEdge]!
  aggregate: AggregateClient!
}

input ClientCreateInput {
  id: ID
  firstname: String!
  lastname: String!
  email: String!
  birthdate: DateTime!
  biometrics: BiometricCreateManyWithoutClientIdInput
  trainerId: UserCreateOneWithoutClientsInput
}

input ClientCreateManyWithoutTrainerIdInput {
  create: [ClientCreateWithoutTrainerIdInput!]
  connect: [ClientWhereUniqueInput!]
}

input ClientCreateOneWithoutBiometricsInput {
  create: ClientCreateWithoutBiometricsInput
  connect: ClientWhereUniqueInput
}

input ClientCreateWithoutBiometricsInput {
  id: ID
  firstname: String!
  lastname: String!
  email: String!
  birthdate: DateTime!
  trainerId: UserCreateOneWithoutClientsInput
}

input ClientCreateWithoutTrainerIdInput {
  id: ID
  firstname: String!
  lastname: String!
  email: String!
  birthdate: DateTime!
  biometrics: BiometricCreateManyWithoutClientIdInput
}

type ClientEdge {
  node: Client!
  cursor: String!
}

enum ClientOrderByInput {
  id_ASC
  id_DESC
  firstname_ASC
  firstname_DESC
  lastname_ASC
  lastname_DESC
  email_ASC
  email_DESC
  birthdate_ASC
  birthdate_DESC
}

type ClientPreviousValues {
  id: ID!
  firstname: String!
  lastname: String!
  email: String!
  birthdate: DateTime!
}

input ClientScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  firstname: String
  firstname_not: String
  firstname_in: [String!]
  firstname_not_in: [String!]
  firstname_lt: String
  firstname_lte: String
  firstname_gt: String
  firstname_gte: String
  firstname_contains: String
  firstname_not_contains: String
  firstname_starts_with: String
  firstname_not_starts_with: String
  firstname_ends_with: String
  firstname_not_ends_with: String
  lastname: String
  lastname_not: String
  lastname_in: [String!]
  lastname_not_in: [String!]
  lastname_lt: String
  lastname_lte: String
  lastname_gt: String
  lastname_gte: String
  lastname_contains: String
  lastname_not_contains: String
  lastname_starts_with: String
  lastname_not_starts_with: String
  lastname_ends_with: String
  lastname_not_ends_with: String
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  birthdate: DateTime
  birthdate_not: DateTime
  birthdate_in: [DateTime!]
  birthdate_not_in: [DateTime!]
  birthdate_lt: DateTime
  birthdate_lte: DateTime
  birthdate_gt: DateTime
  birthdate_gte: DateTime
  AND: [ClientScalarWhereInput!]
  OR: [ClientScalarWhereInput!]
  NOT: [ClientScalarWhereInput!]
}

type ClientSubscriptionPayload {
  mutation: MutationType!
  node: Client
  updatedFields: [String!]
  previousValues: ClientPreviousValues
}

input ClientSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ClientWhereInput
  AND: [ClientSubscriptionWhereInput!]
  OR: [ClientSubscriptionWhereInput!]
  NOT: [ClientSubscriptionWhereInput!]
}

input ClientUpdateInput {
  firstname: String
  lastname: String
  email: String
  birthdate: DateTime
  biometrics: BiometricUpdateManyWithoutClientIdInput
  trainerId: UserUpdateOneWithoutClientsInput
}

input ClientUpdateManyDataInput {
  firstname: String
  lastname: String
  email: String
  birthdate: DateTime
}

input ClientUpdateManyMutationInput {
  firstname: String
  lastname: String
  email: String
  birthdate: DateTime
}

input ClientUpdateManyWithoutTrainerIdInput {
  create: [ClientCreateWithoutTrainerIdInput!]
  delete: [ClientWhereUniqueInput!]
  connect: [ClientWhereUniqueInput!]
  set: [ClientWhereUniqueInput!]
  disconnect: [ClientWhereUniqueInput!]
  update: [ClientUpdateWithWhereUniqueWithoutTrainerIdInput!]
  upsert: [ClientUpsertWithWhereUniqueWithoutTrainerIdInput!]
  deleteMany: [ClientScalarWhereInput!]
  updateMany: [ClientUpdateManyWithWhereNestedInput!]
}

input ClientUpdateManyWithWhereNestedInput {
  where: ClientScalarWhereInput!
  data: ClientUpdateManyDataInput!
}

input ClientUpdateOneWithoutBiometricsInput {
  create: ClientCreateWithoutBiometricsInput
  update: ClientUpdateWithoutBiometricsDataInput
  upsert: ClientUpsertWithoutBiometricsInput
  delete: Boolean
  disconnect: Boolean
  connect: ClientWhereUniqueInput
}

input ClientUpdateWithoutBiometricsDataInput {
  firstname: String
  lastname: String
  email: String
  birthdate: DateTime
  trainerId: UserUpdateOneWithoutClientsInput
}

input ClientUpdateWithoutTrainerIdDataInput {
  firstname: String
  lastname: String
  email: String
  birthdate: DateTime
  biometrics: BiometricUpdateManyWithoutClientIdInput
}

input ClientUpdateWithWhereUniqueWithoutTrainerIdInput {
  where: ClientWhereUniqueInput!
  data: ClientUpdateWithoutTrainerIdDataInput!
}

input ClientUpsertWithoutBiometricsInput {
  update: ClientUpdateWithoutBiometricsDataInput!
  create: ClientCreateWithoutBiometricsInput!
}

input ClientUpsertWithWhereUniqueWithoutTrainerIdInput {
  where: ClientWhereUniqueInput!
  update: ClientUpdateWithoutTrainerIdDataInput!
  create: ClientCreateWithoutTrainerIdInput!
}

input ClientWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  firstname: String
  firstname_not: String
  firstname_in: [String!]
  firstname_not_in: [String!]
  firstname_lt: String
  firstname_lte: String
  firstname_gt: String
  firstname_gte: String
  firstname_contains: String
  firstname_not_contains: String
  firstname_starts_with: String
  firstname_not_starts_with: String
  firstname_ends_with: String
  firstname_not_ends_with: String
  lastname: String
  lastname_not: String
  lastname_in: [String!]
  lastname_not_in: [String!]
  lastname_lt: String
  lastname_lte: String
  lastname_gt: String
  lastname_gte: String
  lastname_contains: String
  lastname_not_contains: String
  lastname_starts_with: String
  lastname_not_starts_with: String
  lastname_ends_with: String
  lastname_not_ends_with: String
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  birthdate: DateTime
  birthdate_not: DateTime
  birthdate_in: [DateTime!]
  birthdate_not_in: [DateTime!]
  birthdate_lt: DateTime
  birthdate_lte: DateTime
  birthdate_gt: DateTime
  birthdate_gte: DateTime
  biometrics_every: BiometricWhereInput
  biometrics_some: BiometricWhereInput
  biometrics_none: BiometricWhereInput
  trainerId: UserWhereInput
  AND: [ClientWhereInput!]
  OR: [ClientWhereInput!]
  NOT: [ClientWhereInput!]
}

input ClientWhereUniqueInput {
  id: ID
}

scalar DateTime

scalar Long

type Mutation {
  createBiometric(data: BiometricCreateInput!): Biometric!
  updateBiometric(data: BiometricUpdateInput!, where: BiometricWhereUniqueInput!): Biometric
  updateManyBiometrics(data: BiometricUpdateManyMutationInput!, where: BiometricWhereInput): BatchPayload!
  upsertBiometric(where: BiometricWhereUniqueInput!, create: BiometricCreateInput!, update: BiometricUpdateInput!): Biometric!
  deleteBiometric(where: BiometricWhereUniqueInput!): Biometric
  deleteManyBiometrics(where: BiometricWhereInput): BatchPayload!
  createClient(data: ClientCreateInput!): Client!
  updateClient(data: ClientUpdateInput!, where: ClientWhereUniqueInput!): Client
  updateManyClients(data: ClientUpdateManyMutationInput!, where: ClientWhereInput): BatchPayload!
  upsertClient(where: ClientWhereUniqueInput!, create: ClientCreateInput!, update: ClientUpdateInput!): Client!
  deleteClient(where: ClientWhereUniqueInput!): Client
  deleteManyClients(where: ClientWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  biometric(where: BiometricWhereUniqueInput!): Biometric
  biometrics(where: BiometricWhereInput, orderBy: BiometricOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Biometric]!
  biometricsConnection(where: BiometricWhereInput, orderBy: BiometricOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BiometricConnection!
  client(where: ClientWhereUniqueInput!): Client
  clients(where: ClientWhereInput, orderBy: ClientOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Client]!
  clientsConnection(where: ClientWhereInput, orderBy: ClientOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ClientConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  node(id: ID!): Node
}

type Subscription {
  biometric(where: BiometricSubscriptionWhereInput): BiometricSubscriptionPayload
  client(where: ClientSubscriptionWhereInput): ClientSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User {
  id: ID!
  clients(where: ClientWhereInput, orderBy: ClientOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Client!]
}

type UserConnection {
  pageInfo: PageInfo!
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreateInput {
  id: ID
  clients: ClientCreateManyWithoutTrainerIdInput
}

input UserCreateOneWithoutClientsInput {
  create: UserCreateWithoutClientsInput
  connect: UserWhereUniqueInput
}

input UserCreateWithoutClientsInput {
  id: ID
}

type UserEdge {
  node: User!
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
}

type UserPreviousValues {
  id: ID!
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserWhereInput
  AND: [UserSubscriptionWhereInput!]
  OR: [UserSubscriptionWhereInput!]
  NOT: [UserSubscriptionWhereInput!]
}

input UserUpdateInput {
  clients: ClientUpdateManyWithoutTrainerIdInput
}

input UserUpdateOneWithoutClientsInput {
  create: UserCreateWithoutClientsInput
  delete: Boolean
  disconnect: Boolean
  connect: UserWhereUniqueInput
}

input UserWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  clients_every: ClientWhereInput
  clients_some: ClientWhereInput
  clients_none: ClientWhereInput
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
}
`