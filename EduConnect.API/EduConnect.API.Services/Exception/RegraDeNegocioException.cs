using System;

namespace EduConnect.API.Services.Exceptions
{
    public class RegraDeNegocioException : Exception
    {
        public RegraDeNegocioException(string mensagem)
            : base(mensagem)
        {
        }
    }
}