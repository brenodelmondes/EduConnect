using System;
using EduConnect.API.Services.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace EduConnect.API.Filters
{
    public class ApiExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (context.Exception is RegraDeNegocioException regra)
            {
                context.Result = new ObjectResult(regra.Message) { StatusCode = regra.StatusCode };
                context.ExceptionHandled = true;
                return;
            }

            if (context.Exception is ArgumentException arg)
            {
                context.Result = new BadRequestObjectResult(arg.Message);
                context.ExceptionHandled = true;
                return;
            }
        }
    }
}
