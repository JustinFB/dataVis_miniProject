export const processHexData = (data) =>
	Promise
	  .all([
		d3.json("./data/uk-local-authority-districts.hexjson"), //with northern ireland removed, https://github.com/odileeds/hexmaps/tree/gh-pages/maps
		d3.csv("./data/LT_to_UT_local_authority_lookup.csv") //https://geoportal.statistics.gov.uk/datasets/ons::lower-tier-local-authority-to-upper-tier-local-authority-december-2016-lookup-in-england-and-wales-1/explore
	  ])	
		.then(([hexjson, csv]) => {
		  
		const h = hexjson.hexes;
		for (var d in h) { //iterate over hexes 
			for (let i = 0; i < data.length; i++) {  
			  if (h[d].id == data[i].ONS_code) {  //match with area in data and include relevant info
				h[d].ONS_code = data[i].ONS_code
				h[d].cars_and_taxis = data[i].cars_and_taxis
				h[d].all_motor_vehicles = data[i].all_motor_vehicles
				h[d].population = data[i].population
			  }
			}
			  if (h[d].ONS_code == undefined) { // added complications with mix of lower and upper tier local authorities in data
				  for (let i = 0; i < csv.length; i++) { 
					  if (h[d].id == csv[i].LTLA16CD) { // match hex with lower tier 
						h[d].name = csv[i].UTLA16NM + " (" + csv[i].LTLA16NM + ")" // add use data from upper tier
						  
						for ( let j = 0; j < data.length; j++ ) {
							if (data[j].ONS_code == csv[i].UTLA16CD) {
								h[d].ONS_code = data[j].ONS_code
								h[d].cars_and_taxis = data[j].cars_and_taxis
								h[d].all_motor_vehicles = data[j].all_motor_vehicles
								h[d].population = data[j].population
							}
						}
					  }
				  }
			  }
	   }
	   
	   return hexjson;
	});