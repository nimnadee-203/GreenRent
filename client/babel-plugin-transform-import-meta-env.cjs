module.exports = function transformImportMetaEnv({ types: t }) {
  return {
    name: "transform-import-meta-env",
    visitor: {
      MemberExpression(path) {
        const { node } = path;

        if (
          t.isMemberExpression(node.object) &&
          t.isMetaProperty(node.object.object) &&
          t.isIdentifier(node.object.object.meta, { name: "import" }) &&
          t.isIdentifier(node.object.object.property, { name: "meta" }) &&
          t.isIdentifier(node.object.property, { name: "env" })
        ) {
          path.replaceWith(t.memberExpression(t.identifier("process"), t.identifier("env")));
        }
      },
    },
  };
};