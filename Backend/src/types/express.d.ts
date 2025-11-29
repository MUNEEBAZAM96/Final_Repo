declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email?: string
        username?: string
      }
    }
    
    namespace Multer {
      interface File {
        url?: string
        public_id?: string
        secure_url?: string
        [key: string]: any
      }
    }
  }
}

export {}

