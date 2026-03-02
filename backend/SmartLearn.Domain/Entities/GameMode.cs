using SmartLearn.Domain.Common;

namespace SmartLearn.Domain.Entities;

public class GameMode : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
