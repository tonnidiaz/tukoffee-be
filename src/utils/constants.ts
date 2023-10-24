import multer from "multer"

enum OrderStatus  {
    pending,
    awaitingPickup,
    completed,
    cancelled,
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
