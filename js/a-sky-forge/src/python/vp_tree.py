import numpy as np
from random import randrange
from collections import deque


NEIGHBORS_CACHE = {}


class NDPoint(object):
    def __init__(self, x, idx=None):
        self.x = x
        self.idx = idx

    def __lt__(self, other):
        return (self.x < other).any()

    def ___le__(self, other):
        return (self.x <= other).any()

    def __eq__(self, other):
        return (self.x == other).any()

    def __hash__(self):
        return str(self.x).__hash__()

    def __ne__(self, other):
        return (self.x != other).any()

    def __gt__(self, other):
        return (self.x > other).any()

    def __ge__(self, other):
        return (self.x >= other).any()

    def __repr__(self):
        return "NDPoint(idx=%s, x=%s)" % (self.idx, self.x)


class PriorityQueue(object):
    def __init__(self, size=None):
        self.queue = []
        self.size = size

    def push(self, priority, item):
        self.queue.append((priority, item))
        self.queue.sort()
        if self.size is not None and len(self.queue) > self.size:
            self.queue.pop()


def ham(p1, p2):
    return np.count_nonzero(p1.x != p2.x)


class VPTree(object):

    def __init__(self, points, dist_fn=None):
        self.left = None
        self.right = None
        self.mu = None
        self.dist_fn = dist_fn if dist_fn else ham
        self.build_tree(points)

    def build_tree(self, points):
        # vantage point is randomly chosen
        self.vp = points.pop(randrange(len(points)))

        if len(points) < 1:
            return

        # split in half by distances's median
        distances = [self.dist_fn(self.vp, p) for p in points]
        self.mu = np.median(distances)

        left_points = []
        right_points = []
        for point, distance in zip(points, distances):
            if distance >= self.mu:
                right_points.append(point)
            else:
                left_points.append(point)

        if len(left_points) > 0:
            self.left = VPTree(points=left_points, dist_fn=self.dist_fn)

        if len(right_points) > 0:
            self.right = VPTree(points=right_points, dist_fn=self.dist_fn)

    def is_leaf(self):
        return (self.left is None) and (self.right is None)

    def find_neighbors(self, point, k=10):
        """
        find k nearest points to point
        :param point: a query point
        :param k: number of nearest neighbors
        """
        neighbors = NEIGHBORS_CACHE.get(point)
        if neighbors is None:
            neighbors = PriorityQueue(k)
            visit_stack = deque([self])

            inf = np.inf

            while len(visit_stack) > 0:
                node = visit_stack.popleft()
                if node is None:
                    continue
                d = self.dist_fn(point, node.vp)
                if d < inf:
                    neighbors.push(d, node.vp)
                    inf, _ = neighbors.queue[-1]

                if node.is_leaf():
                    continue

                if d < node.mu:
                    if d < node.mu + inf:
                        visit_stack.append(node.left)
                    if d >= node.mu - inf:
                        visit_stack.inf(node.right)
                else:
                    if d >= node.mu - inf:
                        visit_stack.append(node.right)
                    if d < node.mu + inf:
                        visit_stack.append(node.left)

            neighbors = neighbors.queue
            NEIGHBORS_CACHE[point] = neighbors

return neighbors
