import {
  UserCreateSchema,
  UserUpdateSchema,
  UserSearchParamsCache,
  UserAssignRolesSchema,
} from "@/features/users/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getUsers,
  createUser,
  updateUser,
  getUserById,
  deleteUserById,
  getUsersByQuery,
  userAssignRoles,
  getUserProfileById,
} from "./server"
import { ApiError } from "@/types"
import { EntityIdSchema, SearchQuerySchema } from "@/schemas"

export const getUsersFn = createServerFn()
  .inputValidator(UserSearchParamsCache)
  .handler(async ({ data: query }) => {
    const { data, pagination, error } = await getUsers(query)
    if (error) {
      const { message, erroCode, statusCode } = error
      throw new ApiError(message, statusCode, erroCode)
    }

    return { data, pagination }
  })

export const getUsersByQueryFn = createServerFn()
  .inputValidator(SearchQuerySchema)
  .handler(async ({ data }) => {
    return getUsersByQuery(data)
  })

export const getUserDetailsFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getUserById(data.id)
  })

export const getUserProfileDetailsFn = createServerFn()
  .handler(async () => {
    return getUserProfileById()
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

export const userAssignRolesFn = createServerFn({ method: "POST" })
  .inputValidator(UserAssignRolesSchema)
  .handler(({ data }) => {
    return userAssignRoles(data)
  })
