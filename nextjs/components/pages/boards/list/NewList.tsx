import { Card, Columns, Flex, Icon, Stack } from 'bumbag';
import gql from 'graphql-tag';
import React, { Fragment, useCallback, useState } from 'react';
import {
  Draggable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';

import { useInsertListMutation } from '../../../../generated/graphql';
import {
  useLastListPosition,
  useSelectedBoard,
} from '../../../../zustands/boards';
import NewCard from '../card/NewCard';
import ListHeader from './ListHeader';

interface NewListProps {
  provided: DroppableProvided;
  snapshot: DroppableStateSnapshot;
}

gql`
  mutation insertList($name: String!, $position: Int!, $board_id: Int!) {
    insert_lists_one(
      object: { name: $name, position: $position, board_id: $board_id }
    ) {
      id
      position
      name
      cards {
        id
        title
        description
        position
      }
    }
  }
`;

const NewList: React.FC<NewListProps> = ({ provided, snapshot }) => {
  const [isCreating, setIsCreating] = useState(false);

  const { selectedBoardId } = useSelectedBoard();
  const { lastPosition } = useLastListPosition();

  const [{ fetching }, insertList] = useInsertListMutation();

  const onSubmit = useCallback(
    async (name: string) => {
      console.log(`🇻🇳 [LOG]: onSubmit -> name`, name);
      try {
        await insertList({
          name,
          position: lastPosition + 1,
          board_id: selectedBoardId,
        });
        setIsCreating(false);
      } catch (err) {
        console.log(`🇻🇳 [LOG]: onSubmit -> err`, err);
      }
    },
    [lastPosition, selectedBoardId]
  );

  const onCancel = () => {
    setIsCreating(false);
  };

  return (
    <Columns.Column>
      <Stack
        ref={provided.innerRef}
        backgroundColor={snapshot.isDraggingOver ? 'secondary' : 'default'}
        paddingX="major-2"
        spacing="major-2"
        {...provided.droppableProps}>
        {isCreating && (
          <Fragment>
            <ListHeader name={''} onSubmit={onSubmit} onCancel={onCancel} />
            <Draggable draggableId={`${Infinity}`} index={Infinity}>
              {(provided, snapshot) => (
                <NewCard text="New" provided={provided} snapshot={snapshot} />
              )}
            </Draggable>
          </Fragment>
        )}
        {!isCreating && (
          <Card
            padding="major-1"
            minWidth="350px"
            cursor="pointer"
            onClick={() => setIsCreating(true)}>
            <Flex alignY="center">
              <Icon icon="solid-plus" marginRight="major-1" /> New
            </Flex>
          </Card>
        )}
      </Stack>
    </Columns.Column>
  );
};

export default NewList;
