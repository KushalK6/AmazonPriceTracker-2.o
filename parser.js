const Nightmare= require('nightmare');
const nightmare=Nightmare({show:false});
require('dotenv').config()
const mailer=require('@sendgrid/mail')
const cron=require('node-cron')

mailer.setApiKey(process.env.SENDGRID_API_KEY)
let element =".a-price-whole"

const args=process.argv.slice(2)
const url=args[0]
const myPrice=args[1]
const userEmail=args[2]
// "https://www.amazon.in/realme-Wireless-Earbuds-Spatial-Charging/dp/B0DBGNY4XP"
const productName= url.split("/")[3].replaceAll("-"," ")

async function priceCheck() {
    try{
        const priceString= await nightmare
            .goto(url)
            .wait(element)
            .evaluate((element)=> {
                const ele=document.querySelector(element)
                return ele?ele.innerText:null
            },element)
            .end()

        if(!priceString) throw new Error("price not found")
        const price= parseFloat(priceString.replace(',',''))
        if(price<myPrice) {
            console.log("buy it!")
            await sendEmail(
                "The price has dropped!",
                `the price of the product ${productName} is Rs.${price} now, do you want to buy it now ? Click here ${url}`
            )
        }
        else console.log(`the price is ${price}, do you want to buy it now?`)
    } catch(err) {
        await sendEmail("an error has occured",err.message)
        console.log("An error occured:",err.message);
    }
    
}

function sendEmail(subject,body){
    const email={
        to: userEmail,
        from: 'pricechecker@gmail.com',
        subject: subject,
        text: body,
        html:body
    }
    return mailer.send(email)
}

cron.schedule("*/30 * * * *", priceCheck);
// function log(){
//     console.log("yo kush!")
// }
// cron.schedule("*/10 * * * * *", log);