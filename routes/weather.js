const express= require("express");
const redis=require("redis");
const weatherRouter=express.Router();
const axios=require("axios");
const apiKey="58c9a12c7a0307fb7b091c0bdce8373b";

weatherRouter.get("/:location",async(req,res)=>{
    const location= req.params.location;
    try {
        const currWeather = await getweather(location);
        console.log(currWeather);
        const weatherforecast = await weatherforcast(location);
        console.log(weatherforecast);
      } catch (error) {
        console.error(error);
      }
      res.send({currWeather,weatherforecast})
})


const getweather=async(location)=>{
    try {
    const response=await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`);
    const data=response.data;
    const temperature=Math.round(data.main.temp - 273.15);
    const description=data.weather[0].description;
    return { location,temperature,description };
    } catch (error) {
        console.log(error);
        throw new Error('Error getting weather data');
    }
}

const weatherforcast=async(location)=>{
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`);
        const data = response.data;
        const forecast = data.list.map((item) => {
          return {
            date: item.dt_txt.substring(0, 10),
            temperature:Math.round(item.main.temp - 273.15),
            description:item.weather[0].description,
          };
        });
        return {location,forecast};
      } catch (error) {
        console.error(error);
        throw new Error('Error getting weather forecast data');
      }
}

module.exports={
    weatherRouter
}