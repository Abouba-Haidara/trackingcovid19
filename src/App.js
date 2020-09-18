import React, { useState, useEffect } from "react";
import { FormControl, Select, MenuItem } from "@material-ui/core";
import {Card, CardContent, Typography} from '@material-ui/core';
import "./App.css";
import InfoBox from './InfoBox';
import Table from './Table';
import LineGraph from './LineGraph';
import { sortData, prettyPrintStat } from "./utils";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";

const urlApi = "https://disease.sh/v3/covid-19/";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("monde");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
   const [mapCountries, setMapCountries] = useState([]);
   const [casesType, setCasesType] = useState("cases");
   const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
   const [mapZoom, setMapZoom] = useState(3);
   useEffect(() => {
      fetch(urlApi + `all`)
         .then(response => response.json())
         .then(data => {
              setCountryInfo(data);
          });
   }, []);

  useEffect(() => {
      const getCountriesData = async () => {
        await fetch(urlApi + `countries`)
          .then(response => response.json())
          .then(data => {
            const countries = data.map(country => ({
              name: country.country,
              value: country.countryInfo.iso2
            }));
            const sortedData =  sortData(data)
            setTableData(sortedData)
            setMapCountries(data);
            setCountries(countries);
          
          });
      };
      getCountriesData();
  }, []);

  const onCountryChange = async e => {
    const countryCode = e.target.value;
    const url = countryCode === "monde" ? urlApi+`all` : urlApi + `countries/${countryCode}`;
    await fetch(url)
      .then(response => response.json())
      .then(data => {
          setCountry(countryCode);
          setCountryInfo(data);
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(4);
        });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Trackeur </h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="monde">Monde Entier</MenuItem>
              {countries.map((country, index) => (
                <MenuItem key={index} value={country.value}>
                  {country.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
         <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Cas Coronavirus"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Guéri"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Mort"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
       
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h2 className="infoBox__cases">Cas Actuel Par Pays</h2>
          <Table countries={tableData} />
          <h3 className="infoBox__cases">Cas au monde </h3>
          <LineGraph casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
