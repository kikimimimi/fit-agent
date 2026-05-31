from __future__ import annotations

from dataclasses import dataclass

from database import AgentMemory


@dataclass
class MemoryManager:
    """SQLite-backed MVP memory manager with a future vector-store boundary."""

    db: object

    def remember(self, user_id: int, memory_type: str, key: str, value: str, source: str = "agent_workflow") -> None:
        item = AgentMemory(
            user_id=user_id,
            memory_type=memory_type,
            key=key,
            value=value,
            source=source,
        )
        self.db.add(item)

    def recent(self, user_id: int, limit: int = 5) -> list[dict]:
        rows = (
            self.db.query(AgentMemory)
            .filter(AgentMemory.user_id == user_id)
            .order_by(AgentMemory.updated_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "type": row.memory_type,
                "key": row.key,
                "value": row.value,
                "source": row.source,
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            }
            for row in rows
        ]
