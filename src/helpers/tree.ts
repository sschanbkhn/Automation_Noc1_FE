export class Tree {
    static getNodeFromTree = (node:any, nodeId:any) => {
        if (node.Id === nodeId) {
            return node;
        } else if (node.Children != null) {
            var result:any = null;
            for (let i = 0; result === null && i < node.Children.length; i++) {
                result = Tree.getNodeFromTree(node.Children[i], nodeId);
            }
            return result;
        }    
        return null;
    }
    static insertNodeIntoTree = (node:any, nodeId:any, newNode:any) => {
        if (node.Id == nodeId) {        
            let n = 0;       
          if (newNode) {
              newNode.nodeId = n;
              newNode.Children = [];
              node.Children.push(newNode);
          }
      } else if (node.Children != null) {
          for (let i = 0; i < node.Children.length; i++) {
            Tree.insertNodeIntoTree(node.Children[i], nodeId, newNode);
          }
  
      }
    } 
    static updateNodeInTree = (node:any, nodeId:any, newNode:any) => {
        if (node.Id == nodeId) {
            node.nodeName = newNode.nodeName;
        } else if (node.Children != null) {
            for (let i = 0; i < node.Children.length; i++) {
                Tree.updateNodeInTree(node.Children[i], nodeId, newNode);
            }
        }
    }  
    static deleteNodeInTree = (node:any, nodeId:any) => {
        if (node.Children != null) {        
            for (let i = 0; i < node.Children.length; i++) {
                let filtered = node.Children.filter((f:any) => f.Id == nodeId);            
                if (filtered && filtered.length > 0) {                
                    node.Children = node.Children.filter((f:any) => f.Id != nodeId);
                    return;
                }
                Tree.deleteNodeInTree(node.Children[i], nodeId);
            }
        }
    }        
}
