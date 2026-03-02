using System.Text.Json;
using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class LibraryMappings
{
    public static LibraryDto ToDto(this Library l) => new(
        l.Id, l.OwnerId, l.Title, l.Description, l.Subject, l.DifficultyLabel,
        DeserializeJsonTags(l.Tags), l.Visibility.ToString().ToLowerInvariant(),
        l.CardCount, l.CreatedAt, l.UpdatedAt);

    public static string[] DeserializeJsonTags(string json)
    {
        try { return JsonSerializer.Deserialize<string[]>(json) ?? []; }
        catch { return []; }
    }
}
