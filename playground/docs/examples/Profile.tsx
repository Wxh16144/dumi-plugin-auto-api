interface ProfileProps {
  /**
   * 用户姓名
   * @default hello
   */
  name: string;
  className?: string;
  /**
   * 年龄
   */
  age?: number;
}

const isNil = (value: any): value is boolean =>
  // eslint-disable-next-line eqeqeq
  value == null;

const Profile = (props: ProfileProps) => {
  const { className, name = 'hello', age } = props;

  return (
    <div className={className}>
      <span>{name}</span>
      {!isNil(age) && <span>:{age}</span>}
    </div>
  );
};

export default Profile;
