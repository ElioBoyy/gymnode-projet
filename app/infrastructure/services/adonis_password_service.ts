import { PasswordService } from '../../domain/services/password_service.js'
import { scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export class AdonisPasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    const salt = Math.random().toString(36).substring(2, 15)
    const hash = (await scryptAsync(password, salt, 32)) as Buffer
    return `${salt}:${hash.toString('hex')}`
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':')
    const derivedKey = (await scryptAsync(password, salt, 32)) as Buffer
    return hash === derivedKey.toString('hex')
  }
}
