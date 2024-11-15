import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          token: { 
            type: 'apiKey',
            in: 'header',
            name: 'token', 
          },
        },
      },
    },
    apis: ['./src/routes/*.ts'], 
  };
  
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  
 export default swaggerDocs;