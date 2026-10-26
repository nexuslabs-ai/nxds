// The parts every host workspace shares, so only the host library's own
// components differ between studies.
export function AdditionSection({ Addition, role, onRoleChange, mode }) {
  return (
    <section className="adoption-addition" aria-label="New member role setting">
      {Addition ? (
        <>
          <span className="adoption-addition-label">
            NEW · DEFAULT MEMBER ROLE
          </span>
          <Addition role={role} onRoleChange={onRoleChange} mode={mode} />
          <span className="adoption-addition-hint">
            New members join as {role}s.
          </span>
        </>
      ) : (
        <div className="adoption-empty-addition">
          Your existing workspace.
          <br />
          No new component yet.
        </div>
      )}
    </section>
  );
}

export function LocalNote({ invited }) {
  return (
    <span className="adoption-local-note" role="status">
      {invited
        ? 'Demo only. Nothing was sent.'
        : 'Try it. Changes stay in this preview.'}
    </span>
  );
}
