import {
  UserCreateSchema,
  UserUpdateSchema,
  UserSearchParamsCache,
} from "@/features/users/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getUsers,
  createUser,
  updateUser,
  deleteUserById,
  getUsersByQuery,
  getUserProfileById,
} from "./server"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"

export const getUsersFn = createServerFn()
  .inputValidator((data) => UserSearchParamsCache.parse(data))
  .handler(async ({ data: query }) => {
    const { data, pagination, error } = await getUsers(query)
    if (error) {
    }

    return { data, pagination }
  })

export const getUsersByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getUsersByQuery(data)
  })

export const getUserProfileFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getUserProfileById(data.id)
  })

export const deleteUserFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteUserById(data.id)
  })

export const updateUserFn = createServerFn({ method: "POST" })
  .inputValidator(UserUpdateSchema)
  .handler(async ({ data }) => {
    return updateUser(data)
  })

export const createUserFn = createServerFn({ method: "POST" })
  .inputValidator(UserCreateSchema)
  .handler(async ({ data }) => {
    return createUser(data)
  })
