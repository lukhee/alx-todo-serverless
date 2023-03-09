import * as createError from 'http-errors'
import * as uuid from 'uuid'
import {createTodoHandler,getTodoHandler,deleteTodoHandler,updateTodoHandler,updateTodoWithUrlHandler} from '../dataLayer/todoAccess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
const logger = createLogger('businesslogic')

// TODO: Implement businessLogic
// :Get User Todos: get todos beloging to a user
export const getTodos = async(userId: string): Promise<TodoItem[] | Error> => {
	try {
		const userTodos = await getTodoHandler(userId)
		return userTodos as TodoItem[]
	} catch(e) {
		return createError(403, `Unauthorized.`)
	}
}

// :Create Todo:
export const createTodo = async(userId: string, CreateTodoRequest: CreateTodoRequest): Promise<TodoItem | Error> => {
	const todoId = uuid.v4()
	const Todo: TodoItem = {
		userId,
		todoId,
		createdAt: new Date().toISOString(),
		done: false,
		attachmentUrl: null,
		...CreateTodoRequest
	}
	try {
		await createTodoHandler(Todo)
		logger.info(`Todo Created Successfully -> `, {
			Todo
		})
		return Todo as TodoItem
	} catch(e) {
		return createError(403, `Unauthorized.`)
	}
}

// :Todo Update:
export const updateTodo = async (userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<void | Error> => {
	logger.info(`---> Start Todo Update ----> `, {
		userId,
		todoId,
		updatedTodo
	})
	try {
		await updateTodoHandler(userId, todoId, updatedTodo)
		logger.info(`---> TODO Update ----> `, {
			userId,
			todoId,
			updatedTodo
		})
	} catch (e) {
		logger.info(`----> Todo Update Error----- -> `, {
			Error: e,
			userId,
			todoId,
			updatedTodo
		})
		return createError(403, `Unauthorized.`)	
	}
}

// :Delete todo:
export const deleteTodo = async(userId: string, todoId: string): Promise<void|Error> => {
	try {
		await deleteTodoHandler(userId, todoId)
	} catch(e) {
		return createError(403, `Unauthorized.`)	
	}
}

// :Upload Update: todo update with image url:
export const createAttachmentPresignedUrl = async(userId: string, todoId: string, attachmentId: string): Promise<string|Error> => {
	try {
		logger.info(`Start Image Upload ---- -> `, {
			attachmentId
		})
		const data = await AttachmentUtils(attachmentId)
		await updateTodoWithUrlHandler(userId, todoId, data.uploadUrl)
		return data.s3SignedUrl
	} catch (e) {
		logger.info(`--- Error Image Upload  Error -----> `, {
			attachmentId
		})
		return createError(403, `Unauthorized.`)	
	}
}