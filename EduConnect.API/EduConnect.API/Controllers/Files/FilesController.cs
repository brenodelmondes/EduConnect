using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.API.Controllers
{
    [ApiController]
    [Route("/files")]
    [Authorize]
    public class FilesController : ControllerBase
    {
        [HttpPost("upload")]
        [RequestSizeLimit(20_000_000)]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(UploadResponse), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Upload(
            IFormFile? file,
            [FromForm] string? purpose,
            [FromForm] string? role,
            [FromForm] int? userId,
            [FromForm] string? courseId,
            [FromForm] string? activityId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Arquivo não enviado.");
            }

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsRoot);

            var fileId = Guid.NewGuid().ToString("N");
            var safeName = Path.GetFileName(file.FileName);
            var extension = Path.GetExtension(safeName);
            var storedName = string.IsNullOrWhiteSpace(extension) ? fileId : $"{fileId}{extension}";
            var storedPath = Path.Combine(uploadsRoot, storedName);

            await using (var stream = System.IO.File.Create(storedPath))
            {
                await file.CopyToAsync(stream);
            }

            var scheme = Request.Scheme;
            var host = Request.Host.Value;
            var url = $"{scheme}://{host}/uploads/{storedName}";

            return Ok(new UploadResponse
            {
                FileId = fileId,
                FileName = safeName,
                Url = url,
            });
        }

        public class UploadResponse
        {
            public string FileId { get; set; } = string.Empty;
            public string FileName { get; set; } = string.Empty;
            public string Url { get; set; } = string.Empty;
        }
    }
}
