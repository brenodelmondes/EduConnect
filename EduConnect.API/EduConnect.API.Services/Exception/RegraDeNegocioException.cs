using System;

namespace EduConnect.API.Services.Exceptions
{
    public class RegraDeNegocioException : Exception
    {
        public int StatusCode { get; }

        public RegraDeNegocioException(string mensagem, int statusCode = 409)
            : base(mensagem)
        {
            StatusCode = statusCode;
        }

        public static RegraDeNegocioException NaoEncontrado(string mensagem)
        {
            return new RegraDeNegocioException(mensagem, 404);
        }

        public static RegraDeNegocioException Conflito(string mensagem)
        {
            return new RegraDeNegocioException(mensagem, 409);
        }
    }
}