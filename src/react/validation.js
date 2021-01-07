import React from "react";

export default function (props) {
  const { validation, Success, Failure } = props;
  return validation.matchWith({
    Success(success) {
      return <Success validation={success} value={success.value} />;
    },
    Failure(failure) {
      return <Failure validation={failure} messages={failure.value} />;
    },
  });
}
