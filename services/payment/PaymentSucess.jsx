import { ArrowBack } from '@mui/icons-material'
import { Avatar, Box, Button, Typography, Zoom, styled, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cartValue, removeItem, updateCheck } from '../../redux/cartRedux'
import { useSnackbar } from 'notistack';
import { selectUser } from '../../redux/userRedux'
import { createOrder, deleteCart, orderListProduct } from '../../redux/apiCalls'
import { orderValue } from '../../redux/orderRedux'
import axios from 'axios'
const Container = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "100vh"
}))

const PaymentSucess = () => {

  const [searchQuery, setSearchQuery] = useSearchParams();
  let paymentId = searchQuery.get("payment_id");
  // console.log(paymentId)
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const [updatePayment, setUpdatePayment] = useState()
  const { enqueueSnackbar } = useSnackbar();
  const [querys, setQuerys] = useState({ "$and": [{ "userId": user && user.currentUser && user.currentUser.data && user.currentUser.data.id }, { "paymentId":  paymentId }] })
  const [sort, setSort] = useState({ name: 1 })

  const cartVal = useSelector(cartValue)
  const order = useSelector(orderValue)

  const totalPrice = cartVal.total;
  let orderData;
  useEffect(() => {
    const checkOrder = async () => {
      orderData = await orderListProduct(querys, sort, dispatch)
      // console.log(orderData)
      if (orderData && orderData.data && orderData.data.status === 'RECORD_NOT_FOUND' && orderData.data.data === null) {
        let data = {
          "userId": `${user.currentUser?.data?.id}`,
          "paymentId": `${paymentId}`,
          "products": [],
          "address": {
            "locality": `${user.currentUser?.data?.address[0]?.locality}`,
            "city": `${user.currentUser?.data?.address[0]?.city}`,
            "state": `${user.currentUser?.data?.address[0]?.state}`,
            "country": `${user.currentUser?.data?.address[0]?.country}`,
            "zipcode": user.currentUser?.data?.address[0]?.zipcode
          },
        }

        cartVal.products?.data?.data?.map((item, index) => {
          const add = [];
          item?.products[0].addonId?.map((i) => {
            add.push(i.id)
          })

          item.products[0].productId !== undefined ? data.products.push({
            "productId": `${item.products[0].productId.id}`,
            "qty": `${item.products[0].qty}`,
            "packageId": `${item.products[0].packageId.id}`,
            "addonId": add,
            "status": "upcoming",
            "paymentStatus": "pending",
            "orderStatus": {
              "orderConfirm": {
                "isConfirmed": true,
                "date": new Date()
              },
              "shipped": {
                "isConfirmed": false,
              },
              "outForDelivery": {
                "isConfirmed": false,
              },
              "delivered": {
                "isConfirmed": false,
              },
              "cancel": {
                "isConfirmed": false,
              },
              "refunded": {
                "isConfirmed": false,
              }
            }
          }) :

            data.products.push({
              "qty": `${item.products[0].qty}`,
              "packageId": `${item.products[0].packageId.id}`,
              "addonId": add,
              "status": "upcoming",
              "paymentStatus": "pending",
              "orderStatus": {
                "orderConfirm": {
                  "isConfirmed": true,
                  "date": new Date()
                },
                "shipped": {
                  "isConfirmed": false,
                },
                "outForDelivery": {
                  "isConfirmed": false,
                },
                "delivered": {
                  "isConfirmed": false,
                },
                "cancel": {
                  "isConfirmed": false,
                },
                "refunded": {
                  "isConfirmed": false,
                }
              }
            })

          return 0;
        })

        if (user.currentUser === null) {
          navigate('/login');
        }
        else {
          const res = await createOrder(data);

          let query = { "userId": `${user.currentUser.data.id}`, "isDeleted": false }
          let sort = { "name": 1 }
          const resGet = await orderListProduct(query, sort, dispatch);
          // console.log(res)
          // console.log(resGet)
          if (res.data ? res.data.status === 'SUCCESS' : false && resGet.data ? resGet.data.status === 'SUCCESS' : false) {
            const updateData = {"userId":`${user.currentUser.data.id}`,
          totalPayment:totalPrice,
          currentPayment:totalPrice
          }
             const res = await axios.put(`${process.env.REACT_APP_BASE_URL}/userapp/payment/update/${paymentId}`, updateData, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }})
              setUpdatePayment(res.data)
              // console.log(res.data)
              // console.log(updatePayment)
            {
              cartVal.products?.data?.data?.map((item, index) => {
                deleteCart(item.id)
                dispatch(removeItem(index))
              })
            }

            dispatch(updateCheck(false))

            enqueueSnackbar('Order Placed  Successfully', {
              variant: 'success',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
              },
              TransitionComponent: Zoom
            });
          }
          else {
            enqueueSnackbar('Some Error Occured', {
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center'
              },
              TransitionComponent: Zoom
            });
          }
        }
      } else {
        navigate("/payment/failed")
      }
    }
    checkOrder()
  }, [querys])


  const navigate = useNavigate()
  const handleClick = () => {
    navigate("/")
  }

  const theme = useTheme()
  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flexDirection: "column" }}  >
        <Box sx={{ display: "flex", justifyContent: "center", }} >

        </Box>
        <Box sx={{ borderRadius: "50px", background: "#fff", boxShadow: "20px 20px 60px #bebebe,-20px -20px 60px #ffffff", width: "345px", height: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "100px 0px 40px 0px", }}>
          <Avatar src='https://techpyro-bucket.sgp1.cdn.digitaloceanspaces.com/techpyro/category/logo/check.png' alt='payment successful'></Avatar>
          <Typography variant='h3' sx={{ color: `${theme.header.textSuccess}`, fontSize: "24px", fontWeight: "600", letterSpacing: "1.5px" }} >Payment Successful!</Typography>
          <Typography sx={{ fontSize: '14px', color: "#878787", padding: "10px", fontWeight: "600", marginTop: "10px", borderBottom: `1px dashed ${theme.header.textSuccess}}`, }} >Transaction Number: {updatePayment && updatePayment.data && updatePayment.data.payment_id}</Typography>

          <Box sx={{ display: "flex", justifyContent: "space-evenly", alignItems: "center", width: "100%", marginTop: "30px" }} >
            <Typography variant='h5' >Amount Paid - </Typography>
            <Typography variant='h4'>{updatePayment && updatePayment.data && updatePayment.data.totalPayment}.00</Typography>
          </Box>
          <Button startIcon={<ArrowBack />} sx={{ marginTop: "50px" }} color='secondary' variant='contained' onClick={handleClick} >Back To Home</Button>
        </Box>
      </Box>
    </Container>
  )
}

export default PaymentSucess