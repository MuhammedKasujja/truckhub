import {
  UserCreateSchema,
  UserUpdateSchemaType,
  UserSearchParamsCache,
} from "@/features/users/schemas"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUserById,
  getUserProfileById,
} from "./data"

export const getUsersFn = createServerFn()
  .inputValidator((data) => UserSearchParamsCache.parse(data))
  .handler(async ({ data: query }) => {
    const { data, pagination, error } = await getUsers(query)
    if (error) {
    }

    return { data, pagination }
  })

export async function getUsersByQuery({ search }: SearchQuery) {
  return getUsers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getUserProfileByIdFn(userId: EntityId) {
  return await getUserProfileById(userId)
}

export async function deleteUserFn(userId: EntityId) {
  return await deleteUserById(userId)
}

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { userId: EntityId; data: Partial<UserUpdateSchemaType> }) => ({
      userId: data.userId,
      data: data.data,
    })
  )
  .handler(async ({ data }) => {
    return await updateUser(data.userId, data.data)
  })

export const createUserFn = createServerFn({ method: "POST" })
  .inputValidator(UserCreateSchema)
  .handler(async ({ data }) => {
    return await createUser(data)
  })

// export async function editUser(
//   data: UserCreateSchemaType | UserUpdateSchemaType,
// ) {
//   if (data instanceof UserCreateSchemaType)
//   return createUser(data);
// }
