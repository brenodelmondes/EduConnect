using BCrypt.Net;

var hash = "$2a$11$ZIfm9QmXgVQ4xUfxLr3o1u3yD0h0mKfW7jO2YB7qQ3pEolcKXxOie";
Console.WriteLine(BCrypt.Net.BCrypt.Verify("123456", hash));
