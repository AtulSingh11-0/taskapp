package com.atul.taskapp.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        // step-1: define the cookie security scheme name
        final String securitySchemeName = "CookieAuth";

        // step-2: configure openapi properties, referencing the cookie scheme
        return new OpenAPI()
                .info(new Info()
                        .title("TaskApp REST API")
                        .description("Task Management API with HttpOnly Cookie Auth and X-API-Version headers")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Atul Singh")
                                .email("cocatul11@gmail.com")))
                .addSecurityItem(new SecurityRequirement()
                        .addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name("jwt")
                                        .type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.COOKIE)
                                        .description("Session JWT Cookie.")));
    }

    @Bean
    public OperationCustomizer customGlobalHeaders() {
        // step-1: append the x-api-version header requirement parameter to all swagger
        // operations universally
        return (operation, handlerMethod) -> {
            Parameter apiVersionHeader = new HeaderParameter()
                    .name("X-API-Version")
                    .description("API Version Document Versioning")
                    .required(false)
                    .schema(new io.swagger.v3.oas.models.media.StringSchema()._default("1"));
            operation.addParametersItem(apiVersionHeader);
            return operation;
        };
    }
}
