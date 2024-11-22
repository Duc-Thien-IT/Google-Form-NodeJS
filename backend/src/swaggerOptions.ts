import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
      server: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        securitySchemes: {
          token: { 
            type: 'apiKey',
            in: 'header',
            name: 'token',
          },
        },
      },
      security: [
        {
            token: [],
        },
      ],
    },
    apis: ['./src/routes/*.ts'], 
  };
  
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  
 export default swaggerDocs;