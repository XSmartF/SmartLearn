using SmartLearn.Application.DTOs;
using SmartLearn.Domain.Entities;

namespace SmartLearn.Application.Mappings;

public static class GameMappings
{
    public static GameModeDto ToDto(this GameMode m) => new(
        m.Id, m.Title, m.Description);
}
