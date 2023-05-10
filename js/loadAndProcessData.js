export const loadAndProcessData = () =>
  Promise
    .all([
      d3.json('./data/regions_BGC.geojson'), //modified to include scotland and wales from country dataset, https://geoportal.statistics.gov.uk/datasets/ons::regions-december-2022-en-bgc/about
	  d3.csv('./data/region_traffic_by_vehicle_type.csv'), //https://roadtraffic.dft.gov.uk/downloads
	  d3.csv('./data/local_authority_traffic.csv'), 		//  ^^
	  d3.csv('./data/pop_estimates.csv') //https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland
    ])
    .then(([geoData, regionData, laData, popData]) => {

      // Add data (from csv) to our GeoJSON data
      geoData.features.forEach(d => {
        for (let i = 0; i < regionData.length; i++) {
          if (d.properties.RGN22CD === regionData[i].ons_code) {
            let year = regionData[i].year
			d.properties[year] = {}
			const x = d.properties[year]; const y = regionData[i]
			
			x.pedal_cycles = +y.pedal_cycles;  // parse integer values
			x.two_wheeled_motor_vehicles = +y.two_wheeled_motor_vehicles
			x.cars_and_taxis = +y.cars_and_taxis
			x.buses_and_coaches = +y.buses_and_coaches
			x.lgvs = +y.lgvs
			x.all_hgvs = +y.all_hgvs
			x.all_motor_vehicles = +y.all_motor_vehicles
			
			for (let j = 0; j < popData.length; j++) {
				if (d.properties.RGN22CD == popData[j].code)
					d.properties.population = +popData[j].population
			}
          }
        }
      });
	  
	  // add population data
	  laData.forEach( d => {
		  d.year = +d.year
		  d.all_motor_vehicles = +d.all_motor_vehicles
		  d.cars_and_taxis = +d.cars_and_taxis
		  for (let j = 0; j < popData.length; j++) {
				if (d.ONS_code == popData[j].code)
					d.population = +popData[j].population
			}
	  });
	 
      // Return the data
      return [geoData, d3.group(laData, d => d.year)]; // grouping local authority data by year
	  
	  
    });