import multer from "multer"

enum OrderStatus  {
    pending = 'pending',
    awaitingPickup = 'awaitingPickup',
    completed = 'completed',
    cancelled = 'cancelled',
}
enum OrderMode   {
    delivery,
    collect
}
enum UserPermissions  {
    read,
    write,
    delete
}



const parser = multer().none()

const DEV = process.env.NODE_ENV != 'production'
export { OrderStatus, UserPermissions, DEV, parser, OrderMode }
