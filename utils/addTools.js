// client.addTool(
  //     {
  //       name: 'property_search',
  //       description: 'Search for properties based on the location and budget of the user',
  //       parameters: {
  //         type: 'object',
  //         properties: {
  //           location: {
  //             type: 'string',
  //             description:
  //               'The location of the user',
  //           },
  //           budget: {
  //             type: 'string',
  //             description: 'The budget of the user',
  //           },
  //         },
  //         required: ['location', 'budget'],
  //       },
  //     },
  //     async ({ location, budget }) => {

  //       let propOptions = [
  //         `
  //           24K Opula, पिंपरी Nilakh – 3BHK, 4BHK, rupees  "one cr eighty seven lakh"
  //           Luxury fittings, designer sundecks, IGBC certified, eco-friendly, premium interiors.
  //         `,
  //         `
  //           Life Republic, Punawale – 2BHK, 3BHK, rupees "sixy seven lakh" onwards
  //           Large balconies, master suites, 20+ amenities, near Hinjewadi IT Park, designed for light & privacy.
  //         `
  //       ]
        
  //       let randomIndex = Math.floor(Math.random() * propOptions.length);
  //       let selectedProperty = propOptions[randomIndex];

  //       console.log(selectedProperty)
  //       return selectedProperty;
  //     }
  // );


  // client.addTool(
  //   {
  //     name: 'call_end',
  //     description: 'End the call once you are done with the conversation',
  //     parameters: {
  //       type: 'object',
  //       properties: {
  //         reason: {
  //           type: 'string',
  //           description:
  //             'The reason to end the conversation',
  //         },
  //         summary: {
  //           type: 'string',
  //           description: 'Summary of the conversation',
  //         },
  //       },
  //       required: ['reason', 'summary'],
  //     },
  //   },
  //   async ({ reason, summary }) => {
  //     console.log("Tool call triggered")
  //     console.log(reason)
  //     console.log(summary)
  //     await new Promise(r => setTimeout(r, 1500));
  //     client.disconnect()
  //     ws.close()
  //     return { ok: true };
  //   },
  //   true
  // );