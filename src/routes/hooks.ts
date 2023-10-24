import { Router } from "express"
import io from "../utils/io"

const router = Router()

const yocoResp = {
    createdDate: '2023-10-15T17:12:20.936383Z',
    id: 'evt_ZgnMyBeRk5DtAAlUOJACjNEn',
    payload: {
      amount: 2500,
      createdDate: '2023-10-15T17:11:51.742571Z',
      currency: 'ZAR',
      id: 'p_Kg7b2Q95B8JS6jWf2zdhj0DE',
      metadata: {
        checkoutId: 'ch_ngopyGvWBwXIG9u6jnCpdkxB',
        productType: 'checkout'
      },
      mode: 'test',
      paymentMethodDetails: { card: [Object], type: 'card' },
      status: 'succeeded',
      type: 'payment'
    },
    type: 'payment.succeeded'
  }

router.post('/yoco', async (req, res)=>{
    console.log(req.body)
    io.emit('payment', {
        gateway: 'yoco',
        data: req.body
    })
    res.send("OK")
})

export default router

