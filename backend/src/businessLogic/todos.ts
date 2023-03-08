
import * as createError from 'http-errors'
import * as uuid from 'uuid'
import {createTodoHandler,getTodoHandler,deleteTodoHandler,updateTodoHandler,updateTodoWithUrlHandler} from '../dataLayer/todoAccess.js'
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
			// Additional information stored with a log statement
			Todo
		})
		return Todo as TodoItem
	} catch (e) {
		logger.info("Todo Created Error", {
			// Additional information stored with a log statement
			Todo
			})
		return createError(403, `Unauthorized.`)
	}
}

// :Todo Update:
export const updateTodo = async(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<void|Error> => {
	try {
		await updateTodoHandler(userId, todoId, updateTodoRequest)
		logger.info("<-- Todo Updated successfully -->", {
			// Additional information stored with a log statement
			msg: `Todo: ${todoId} can not be updated`
			})
	} catch (e)
	{
		logger.info("<-- Todo updated Error -->", {
		// Additional information stored with a log statement
		msg: `Todo: ${todoId} can not be updated`
		})
		return createError(403, `Unauthorized.`)	
	}
}

// :Delete todo:
export const deleteTodo = async(userId: string, todoId: string): Promise<void|Error> => {
	try {
		await deleteTodoHandler(userId, todoId)
		logger.info("<-- Todo Deleted Successfully -->", {
			// Additional information stored with a log statement
			msg: `Todo: ${todoId} can not be updated`
			})
	} catch (e) {
		logger.info("<-- Todo Deleted Error -->", {
			// Additional information stored with a log statement
			msg: `Todo: ${todoId} can not be deleted`
			})
		return createError(403, `Unauthorized.`)	
	}
}

// :Upload Update: todo update with image url:
export const createAttachmentPresignedUrl = async(userId: string, todoId: string, attachmentId: string): Promise<string|Error> => {
	try {
		const data = await AttachmentUtils(attachmentId)
		await updateTodoWithUrlHandler(userId, todoId, data.uploadUrl)
		logger.info("<-- Todo Attachment Cretaed Successfully -->", {
			// Additional information stored with a log statement
			msg: `Todo: ${todoId} attachment created`
			})
		return data.s3SignedUrl
	} catch (e) {
		logger.info("<-- Todo Attachment Error -->", {
			// Additional information stored with a log statement
			msg: `Todo: ${todoId} attachment can not be created`
			})
		return createError(403, `Unauthorized.`)	
	}
}