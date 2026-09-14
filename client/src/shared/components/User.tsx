function User(props: { username?: string }) {
  return (
    <div>
      <h1>USUARIO:</h1>
      <p>{props.username}</p>
    </div>
  );
}

export { User };