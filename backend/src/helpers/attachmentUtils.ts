import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
// TODO: Implement the fileStogare logic

import { attachmentItem } from '../models/AttachmentItem'
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const targetBucket = new XAWS.S3({ signatureVersion: 'v4' })

export const AttachmentUtils = (attachmentId: string): attachmentItem  => {
	const s3SignedUrl = targetBucket.getSignedUrl('putObject', {
		Bucket: bucketName,
		Key: attachmentId,
		Expires: Number(urlExpiration)
	})
	let uploadUrl: string = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`
	return {
	 s3SignedUrl,
		uploadUrl
	}
}